using DataManager.Auth;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products/{productId}/connections")] [ApiController] [AuthFilter]
public class ProductConnectionController(ITrinoStore trinoStore) : ControllerBase {
  [HttpPost("datasets")] public Task<List<TrackedDataSet>> ListConnectionDataSets(string productId, DataConnection connection) => trinoStore.ListDataSets(connection);

  [HttpPost("datasets/{dataSetName}")] public Task<TrackedDataSet> GetConnectionDataSet(string productId, string dataSetName, DataConnection connection) => trinoStore.GetDataSet(dataSetName, connection);

  [HttpPost("execute")] public Task<List<Dictionary<string, object>>> ExecuteQuery(string productId, string connectionId) => null;
}