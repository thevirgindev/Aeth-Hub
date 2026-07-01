use discord_rich_presence::{DiscordIpc, DiscordIpcClient, activity::{Activity, Timestamps, Assets, Button, Party, Secrets}};

pub struct DiscordRpc {
    client: Option<DiscordIpcClient>,
    connected_ts: i64,
}

impl DiscordRpc {
    pub fn new() -> Self {
        Self { client: None, connected_ts: 0 }
    }

    pub fn connect(&mut self, client_id: &str) -> Result<(), String> {
        self.disconnect();
        let mut client = DiscordIpcClient::new(client_id);
        client.connect()
            .map_err(|e| format!("Discord RPC connect failed: {}", e))?;
        self.connected_ts = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        self.client = Some(client);
        Ok(())
    }

    pub fn update(&mut self, state: &str, details: &str) -> Result<(), String> {
        if let Some(ref mut client) = self.client {
            let activity = Activity::new()
                .state(state)
                .details(details)
                .assets(Assets::new()
                    .large_image("aeth")
                    .large_text("Aeth Hub")
                    .small_image("aeth-withnobg_c")
                    .small_text("Aeth Hub"))
                .timestamps(Timestamps::new().start(self.connected_ts))
                .party(Party::new().id("ae488379-351d-4a4f-ad32-2b9b01c91657").size([1, 5]))
                .secrets(Secrets::new().join("MTI4NzM0OjFpMmhuZToxMjMxMjM="))
                .buttons(vec![
                    Button::new("Join Discord", "https://discord.gg/DDGbbpexB9"),
                ]);
            client.set_activity(activity)
                .map_err(|e| format!("Discord RPC update failed: {}", e))?;
        }
        Ok(())
    }

    pub fn disconnect(&mut self) {
        if let Some(ref mut client) = self.client {
            let _ = client.close();
        }
        self.client = None;
        self.connected_ts = 0;
    }
}
