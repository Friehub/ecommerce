// jumia-clone Service Macros
// Adapted from taas-gateway/rust/shared/src/macros.rs

/// Macro to define consistent NewType identifiers.
/// Implements new(), Display, FromStr, and as_str().
#[macro_export]
macro_rules! define_id_type {
    ($name:ident, $doc:expr) => {
        #[doc = $doc]
        #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, serde::Serialize, serde::Deserialize, Default)]
        pub struct $name(pub(crate) String);

        impl $name {
            /// Creates a new instance from a string-like value.
            /// Errors if the input is empty.
            pub fn new(id: impl Into<String>) -> Result<Self, String> {
                let s = id.into();
                if s.is_empty() {
                    return Err("Identifier cannot be empty".to_string());
                }
                Ok(Self(s))
            }

            /// Returns the underlying string reference.
            #[must_use] 
            pub fn as_str(&self) -> &str {
                &self.0
            }

            /// Creates a mock instance for testing.
            pub fn new_mock() -> Self {
                Self("mock_id".to_string())
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.0)
            }
        }

        impl std::str::FromStr for $name {
            type Err = String;
            fn from_str(s: &str) -> Result<Self, Self::Err> {
                Self::new(s)
            }
        }

        impl From<String> for $name {
            fn from(s: String) -> Self {
                Self(s)
            }
        }

        impl From<&str> for $name {
            fn from(s: &str) -> Self {
                Self(s.to_string())
            }
        }
    };
}

/// Macro to implement Debug with field redaction for sensitive data.
#[macro_export]
macro_rules! impl_redacted_debug {
    ($name:ident, { $($field:ident),* }, { $($redacted:ident),* }) => {
        impl std::fmt::Debug for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                f.debug_struct(stringify!($name))
                    $(.field(stringify!($field), &self.$field))*
                    $(.field(stringify!($redacted), &"[REDACTED]"))*
                    .finish()
            }
        }
    };
}
