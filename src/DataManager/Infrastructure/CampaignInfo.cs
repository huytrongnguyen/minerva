using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataManager.Infrastructure;

[Table("campaign_info")] public class CAMPAIGN_INFO {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long Id { get; set; }
  public string MediaSource { get; set; }
  public string Objective { get; set; }
  public string CampaignId { get; set; }
  public string CampaignName { get; set; }
  public string CampaignStatus { get; set; }
  public string BudgetMode { get; set; }
  public double Budget { get; set; }
  [Column(TypeName = "jsonb")] public Dictionary<string, string> Options { get; set; } = [];
  public int GenRandomSeed { get; set; }
  public DateTime StartTime { get; set; }
  public DateTime? EndTime { get; set; }
  public DateTime CreateTime { get; set; }
  public DateTime? ModifyTime { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
}