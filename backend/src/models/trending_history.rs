use crate::schema::trending_history;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = trending_history)]
pub struct TrendingHistory {
    pub id: i64,
    pub repository_id: Option<i64>,
    pub stars: i32,
    pub forks: i32,
    pub recorded_at: Option<NaiveDateTime>,
}

#[derive(Insertable, Deserialize, Debug)]
#[diesel(table_name = trending_history)]
pub struct NewTrendingHistory {
    pub repository_id: i64,
    pub stars: i32,
    pub forks: i32,
}

#[allow(dead_code)]
impl TrendingHistory {
    /// Validate trending history data
    pub fn validate(&self) -> Result<(), String> {
        if self.stars < 0 {
            return Err("Stars count cannot be negative".to_string());
        }

        if self.forks < 0 {
            return Err("Forks count cannot be negative".to_string());
        }

        Ok(())
    }

    /// Calculate star growth from previous record
    pub fn star_growth(&self, previous: &TrendingHistory) -> i32 {
        self.stars - previous.stars
    }

    /// Calculate fork growth from previous record
    pub fn fork_growth(&self, previous: &TrendingHistory) -> i32 {
        self.forks - previous.forks
    }

    /// Check if this is a recent record (within last 24 hours)
    pub fn is_recent(&self) -> bool {
        if let Some(recorded_at) = self.recorded_at {
            let now = chrono::Utc::now().naive_utc();
            let hours_diff = now.signed_duration_since(recorded_at).num_hours();
            hours_diff <= 24
        } else {
            false
        }
    }
}

impl NewTrendingHistory {
    /// Validate new trending history data
    pub fn validate(&self) -> Result<(), String> {
        if self.stars < 0 {
            return Err("Stars count cannot be negative".to_string());
        }

        if self.forks < 0 {
            return Err("Forks count cannot be negative".to_string());
        }

        Ok(())
    }
}
