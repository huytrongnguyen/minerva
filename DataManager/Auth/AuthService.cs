using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;
using DataManager.Shared;

namespace DataManager.Auth;

public class AuthService(HttpClient httpClient, IConfiguration configuration, ILogger<AuthService> logger) {
  public AuthUser VerifyToken(string token, string redirectUrl) {
    string url = configuration.GetValue<string>("OAuth:VerifyUrl").Replace("{token}", token).Replace("{redirectUrl}", redirectUrl);
    logger.Console($"url = {url}");
    var httpClient = new HttpClient();
    var response = httpClient.GetAsync(url).Result;
    var responseText = response.Content.ReadAsStringAsync().Result;
    logger.Console($"responseText = {responseText}");

    var authUser = new AuthUser("", "", "");

    // var response = HttpUtils.Get<AuthResponse>(url);
    // if (response?.serviceResponse?.authenticationSuccess == null) { return null; }

    // var authInfo = response.serviceResponse.authenticationSuccess;
    // var authUser = authInfo.profile;
    // authUser.username = authInfo.user;

    // var tokenHandler = new JwtSecurityTokenHandler();
    // var key = Encoding.UTF8.GetBytes(SecretKey);
    // var tokenDescriptor = new SecurityTokenDescriptor {
    //   Subject = new ClaimsIdentity(new[] {
    //     new Claim("id", authUser.username),
    //     new Claim("username", authUser.username),
    //     new Claim("displayName", authUser.displayName),
    //     new Claim("employeeID", authUser.employeeID),
    //     new Claim("departmentID", authUser.departmentID),
    //     new Claim("departmentCode", authUser.departmentCode),
    //     new Claim("department", authUser.department),
    //     new Claim("jobTitle", authUser.jobTitle),
    //     new Claim("mail", authUser.mail),
    //   }),
    //   Expires = DateTime.UtcNow.AddDays(30),
    //   SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256),
    // };
    // var securityToken = tokenHandler.CreateToken(tokenDescriptor);
    // var jwtToken = tokenHandler.WriteToken(securityToken);

    // authUser.token = jwtToken; // return to client to cache in LocalStorage

    return authUser;
  }

  public async Task<AuthUser> VerifyAuthUser(string code) {
    var verifyUrl = configuration.GetValue<string>("OAuth:VerifyUrl").Replace("{code}", code);
    logger.Console($"verifyUrl = {verifyUrl}");

    var request = new HttpRequestMessage(HttpMethod.Get, verifyUrl);
    var responseMessage = await httpClient.SendAsync(request);
    logger.Console($"StatusCode = {responseMessage.StatusCode}");
    logger.Console($"ContentType = {responseMessage.Content.Headers.ContentType}");

    var responseText = await responseMessage.Content.ReadAsStringAsync();
    logger.Console($"responseText = {responseText}");

    // var response = ObjectUtils.Decode<AuthResponse>(responseText);
    // return ProcessAuthResponse(response);

    var authUser = new AuthUser(
      Username: code,
      DisplayName: code,
      Token: GenerateToken(new Dictionary<string, string> {
        { "Username", code }
      }) // return to client to cache in LocalStorage
    );

    return authUser;
  }

  public AuthUser GetAuthUser(string token) {
    if (token.IsEmpty()) return null;

    try {
      tokenHandler.ValidateToken(token, new TokenValidationParameters {
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = signingKey,
          ValidateIssuer = false,
          ValidateAudience = false,
          // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
          ClockSkew = TimeSpan.Zero
      }, out SecurityToken validatedToken);

      var jwtToken = (JwtSecurityToken)validatedToken;
      var user = jwtToken.Claims.ToDictionary(x => x.Type, x => x.Value).Transform<AuthUser>();
      return user;
    } catch (Exception e) {
      logger.Console(e.Message);
      return null;
    }
  }


  private string GenerateToken(Dictionary<string, string> authInfo) {
    var token = new JwtSecurityToken(
      claims: authInfo.Select(pair => new Claim(pair.Key, pair.Value)),
      expires: DateTime.UtcNow.AddDays(30),
      signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
    );
    return tokenHandler.WriteToken(token);
  }

  private readonly SecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
  private readonly SecurityKey signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
}

public record AuthResponse([property: JsonPropertyName("serviceResponse")] AuthResponse.AuthResult Result) {
  public record AuthResult(
    [property: JsonPropertyName("authenticationFailure")] AuthFailure? Failure,
    [property: JsonPropertyName("authenticationSuccess")] AuthSuccess? Success
  );

  public record AuthFailure(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("description")] string Description
  );

  public record AuthSuccess(
    [property: JsonPropertyName("user")] string Username,
    [property: JsonPropertyName("profile")] UserInfo UserInfo
  );

  public record UserInfo(
    [property: JsonPropertyName("displayName")] string DisplayName
  );
}

public record AuthUser(string Username, string DisplayName, string? Token);
