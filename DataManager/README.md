# Data Manager

## How to Build

**Clone `rosie` to this repo**

```
$ git submodule add https://github.com/huytrongnguyen/rosie DataManager/ClientApp/rosie
$ npm run rosie-init-bootstrap
```

**Build Frontend**

```sh
$ npm install
$ npm run bootstrap-copy
$ npm run fonts-copy
$ npm run css-build
```

**Build Backend**

```sh
$ dotnet build
```

## How to Run

```sh
$ dotnet run
```

## Git Submodules basic explanation

In Git you can add a submodule to a repository. This is basically a repository embedded in your main repository. This can be very useful. A couple of usecases of submodules:
- Separate big codebases into multiple repositories.
- Re-use the submodule in multiple parent repositories.

You can add a submodule to a repository like this:

```sh
$ git submodule add <github_url> <folder_name>
```

To remove submodule:

```sh
$ git rm -f <path_to_submodule>
$ rm -rf .git/modules/<path-to-submodule>
$ git config --remove-section submodule.<path-to-submodule>
```

### Use Visual Studio Code

- Create a solution: `dotnet new sln`
- Create a console app: `dotnet new console -o ShowCase`
- Create a class library project: `dotnet new classlib -o StringLibrary`
- Create a unit test project: `dotnet new xunit -o StringLibrary.Tests`
- Add a project to a solution: `dotnet sln add todo-app/todo-app.csproj`
- Add a project reference: `dotnet add ShowCase/ShowCase.csproj reference StringLibrary/StringLibrary.csproj`
- Create a minimal web API: `dotnet new web -o TodoApi`
- Create a Razor Pages web app: `dotnet new webapp -o RazorPagesMovie`