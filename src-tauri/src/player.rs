use std::process::Command as StdCommand;
use tokio::process::Command;
use std::sync::OnceLock;

static PLAYER: OnceLock<String> = OnceLock::new();

pub fn detect_player() -> Option<String> {
    if let Some(p) = PLAYER.get() { return Some(p.clone()) }
    for name in &["mpv", "vlc", "mpc-hc"] {
        if which::which(name).is_ok() {
            let p = name.to_string();
            let _ = PLAYER.set(p.clone());
            return Some(p);
        }
    }
    None
}

pub async fn play_url(url: &str, title: &str, player: &str) -> Result<(), String> {
    match player {
        "mpv" => {
            Command::new("mpv")
                .arg(url)
                .arg(format!("--force-media-title={}", title))
                .arg("--cache=yes")
                .arg("--demuxer-max-bytes=500MiB")
                .arg("--fs")
                .spawn()
                .map_err(|e| e.to_string())?;
            Ok(())
        }
        "vlc" => {
            StdCommand::new("vlc")
                .arg(url)
                .arg("--fullscreen")
                .arg("--play-and-exit")
                .spawn()
                .map_err(|e| e.to_string())?;
            Ok(())
        }
        "mpc-hc" => {
            StdCommand::new("mpc-hc")
                .arg(url)
                .arg("/fullscreen")
                .arg("/close")
                .spawn()
                .map_err(|e| e.to_string())?;
            Ok(())
        }
        _ => Err("unknown player".into()),
    }
}
