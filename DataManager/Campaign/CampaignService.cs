using DataManager.Shared;

namespace DataManager.Campaign;

public class CampaignService(ICampaignStore campaignStore, ILogger<CampaignService> logger) {
  public IEnumerable<CampaignInfo> List() => campaignStore.List();
  public Task<IEnumerable<CampaignInfo>> Generate() {
    var campaigns = MediaSourceBaselineDictionary.Keys.SelectMany(mediaSource => {
      var total = Imc.RandomInt(1, 50);
      logger.Console($"Generating {total} campaigns from '{mediaSource}'");
      var campaigns = new List<CampaignCreate>();
      for (var i = 0; i < total; ++i) {
        campaigns.Add(GenerateCampaign(mediaSource, "DAILY", Imc.RandomInt(5, 10) * 1000));
      }
      return campaigns;
    }).ToList();

    return campaignStore.Save(campaigns);
  }

  private static CampaignCreate GenerateCampaign(string mediaSource, string budgetType, double budget) {
    var campaignId = snowflakeIdGen.NextId();
    return new CampaignCreate(
      MediaSource: mediaSource,
      Objective: "APP_INSTALLS",
      CampaignId: $"{campaignId}",
      CampaignName: $"{mediaSource} | {campaignId} | {budgetType} | {budget}",
      BudgetMode: budgetType,
      Budget: budget
    );
  }

  public IEnumerable<CampaignInfo> GenerateDailyPerformance() {
    var campaigns = campaignStore.GetActiveCampaigns();
    // var campaigns = MediaSourceBaselineDictionary.Keys.SelectMany(mediaSource => {
    //   var total = Imc.RandomInt(1, 50);
    //   logger.Console($"Generating {total} campaigns from '{mediaSource}'");
    //   var campaigns = new List<CampaignCreate>();
    //   for (var i = 0; i < total; ++i) {
    //     campaigns.Add(GenerateCampaign(mediaSource, "DAILY", Imc.RandomInt(5, 10) * 1000));
    //   }
    //   return campaigns;
    // }).ToList();

    // return campaignStore.Save(campaigns);
    return campaigns;
  }

  // private static CampaignCreate GenerateCampaign(string mediaSource, string budgetType, double budget) {
  //   var campaignId = snowflakeIdGen.GenerateId();
  //   return new CampaignCreate(
  //     MediaSource: mediaSource,
  //     Objective: "APP_INSTALLS",
  //     CampaignId: $"{campaignId}",
  //     CampaignName: $"{mediaSource} | {campaignId} | {budgetType} | {budget}",
  //     BudgetMode: budgetType,
  //     Budget: budget
  //   );
  // }


  public static readonly Dictionary<string, MediaSourceBaseline> MediaSourceBaselineDictionary = new() {
    { "facebook_ads", new(BaseImpressions: 50000, CtrMean: 0.022, CvrMean: 0.28, CpiMean: 7.0) },
    { "google_ads", new(BaseImpressions: 150000, CtrMean: 0.015, CvrMean: 0.35, CpiMean: 5.0) },
    { "titkok_ads", new(BaseImpressions: 80000, CtrMean: 0.012, CvrMean: 0.22, CpiMean: 9.0) }
  };
  public static readonly SnowflakeIdGen snowflakeIdGen = Imc.NewSnowflakeId(1); // Choose a unique workerId per instance
}

public interface ICampaignStore : IDataStore<CampaignInfo> {
  IEnumerable<CampaignInfo> GetActiveCampaigns();
  Task<IEnumerable<CampaignInfo>> Save(List<CampaignCreate> campaigns);
}