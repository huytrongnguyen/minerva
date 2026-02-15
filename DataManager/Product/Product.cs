using DataManager.Shared;

namespace DataManager.Product;

public record ProductInfo(string ProductId, DateOnly StartDate);
public record ProductSettings(List<DataConnection> Connections, List<EventMapping> EventMappings);

public record EventMapping(string EventMappingId, string TableName, string EventName);
