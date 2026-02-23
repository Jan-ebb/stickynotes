use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum WindowLevel {
    Normal,
    #[serde(rename = "alwaysOnTop")]
    AlwaysOnTop,
    Desktop,
}

impl Default for WindowLevel {
    fn default() -> Self {
        WindowLevel::Normal
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub content: String,
    pub bg_color: String,
    pub fg_color: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub window_level: WindowLevel,
    pub created_at: String,
    pub updated_at: String,
}

impl Note {
    pub fn new() -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Note {
            id: uuid::Uuid::new_v4().to_string(),
            content: String::new(),
            bg_color: "#0a0e14".to_string(),
            fg_color: "#00ff88".to_string(),
            x: 100.0,
            y: 100.0,
            width: 320.0,
            height: 280.0,
            window_level: WindowLevel::Normal,
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

pub struct NotesStore {
    pub notes: HashMap<String, Note>,
}

impl NotesStore {
    pub fn new() -> Self {
        NotesStore {
            notes: HashMap::new(),
        }
    }
}

pub type NotesState = Mutex<NotesStore>;
