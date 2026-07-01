// Future: Use libtorrent-rasterbar or qp2p to:
// 1. Add magnet to torrent session
// 2. Wait for metadata
// 3. Start local HTTP server serving the downloaded pieces
// 4. Return `http://localhost:{port}/stream/{info_hash}` to the webview <video> element

pub struct Streamer;

impl Streamer {
    pub fn new() -> Self {
        Self
    }

    pub async fn start_stream(&self, _magnet: &str) -> Result<String, String> {
        Ok("http://localhost:2095/stream/placeholder".to_string())
    }

    pub async fn stop_stream(&self, _id: &str) {
    }

    pub fn get_stream_url(&self, _id: &str) -> Option<String> {
        None
    }
}
