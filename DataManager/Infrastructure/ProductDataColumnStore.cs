using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using DataManager.Shared;

namespace DataManager.Infrastructure;

[Table("product_datacolumn")] public class PRODUCT_DATACOLUMN {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long Id { get; set; }
  public string ProductId { get; set; }
  public string DatasetName { get; set; }
  public string TableName { get; set; }
  public string ColumnName { get; set; }
  public string? ColumnDisplayName { get; set; }
  public string? ColumnSemanticName { get; set; }
  public string? ColumnType { get; set; }
  public string? ColumnDesc { get; set; }
}
