namespace DataManager.Campaign;

public record MediaSourceBaseline(
  long BaseImpressions, // Typical Daily Impressions
  double CtrMean, // (Clicks/Impressions)
  double CvrMean, // (Installs/Clicks)
  double CpiMean  // (Cost per Install)
);

public record CampaignCreate(
  string MediaSource, // "facebook_ads" | "google_ads" | "tiktok_ads"
  string CampaignId, 
  string CampaignName,
  double Budget,
  string BudgetMode = "DAILY", // "DAILY" | "LIFETIME"
  string Objective = "APP_INSTALLS" // "APP_INSTALLS" | "CONVERSIONS" | "TRAFFIC"
);

public record CampaignInfo(
  long Id,
  string MediaSource,
  string Objective,
  string CampaignId, 
  string CampaignName,
  string Status, // "ACTIVE" | "PAUSED"
  string BudgetMode,
  double Budget,
  Dictionary<string, string> Options,
  int GenRandomSeed,
  DateTime StartTime,
  DateTime? EndTime,
  DateTime CreateTime,
  DateTime? ModifyTime,
  DateTime CreatedAt,
  DateTime? UpdatedAt
) {
  public class CampaignStatus {
    public const string ACTIVE = "ACTIVE";
    public const string PAUSED = "PAUSED";
  }
}

public record DailyCampaignPerformanceCreate(
  DateOnly EventDate, 
  string MediaSource,
  string CampaignId,
  long Impressions,
  long Clicks,
  double Spend,
  DateTime CreatedAt,
  DateTime? UpdatedAt
);