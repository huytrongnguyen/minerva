using DataManager.Shared;

namespace DataManager.Product;

public record ProductDataSet(string Name);

public record ProductDataSetUpdateRequest(List<string> DataSets);

public interface IProductDataSetStore : IDataStore<ProductDataSet> {
  List<ProductDataSet> List(string productId);
  List<ProductDataSet> BatchUpdate(string productId, List<string> dataSetNames);
}
