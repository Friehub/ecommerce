// jumia-clone Service Utilities
// Adapted from taas-gateway/rust/shared/src/utils.rs

/// Returns the current UNIX timestamp in seconds.
pub fn now_unix() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

/// Returns the current UNIX timestamp in milliseconds.
pub fn now_millis() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}

/// Normalizes a JSON Value for deterministic processing.
/// This converts map keys to alphabetical order.
pub fn normalize_json_value(val: &serde_json::Value) -> serde_json::Value {
    match val {
        serde_json::Value::Object(map) => {
            let mut sorted_map = serde_json::Map::new();
            let mut keys: Vec<_> = map.keys().collect();
            keys.sort();
            for k in keys {
                sorted_map.insert(k.clone(), normalize_json_value(map.get(k).unwrap()));
            }
            serde_json::Value::Object(sorted_map)
        }
        serde_json::Value::Array(arr) => {
            let normalized_arr = arr.iter().map(normalize_json_value).collect();
            serde_json::Value::Array(normalized_arr)
        }
        _ => val.clone(),
    }
}
