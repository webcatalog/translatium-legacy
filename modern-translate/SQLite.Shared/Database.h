#pragma once

namespace SQLite
{
	ref class Database;
	ref class ExecuteResultRow;
	ref class ColumnEntry;

	public ref class Database sealed
	{
	public:
		static Windows::Foundation::IAsyncOperation<Database^> ^OpenDatabaseInFolderAsync(Windows::Storage::StorageFolder ^databaseFolder, Platform::String ^databaseFileName);

		virtual ~Database();

		Windows::Foundation::IAsyncOperationWithProgress<Windows::Foundation::Collections::IVector<ExecuteResultRow^>^, ExecuteResultRow^> ^ExecuteAsync(Platform::String ^statementAsString);
		Windows::Foundation::IAsyncOperationWithProgress<Windows::Foundation::Collections::IVector<ExecuteResultRow^>^, ExecuteResultRow^> ^BindAndExecuteAsync(Platform::String ^statementAsString, Windows::Foundation::Collections::IVector<Platform::String^> ^parameterValues);

	private:
		Database();

		void CloseDatabase();

		void EnsureInitializeTemporaryPath();
		void OpenPath(const std::string &databasePath);

		static int SQLiteExecCallback(void *context, int columnCount, char **columnNames, char **columnValues);

		sqlite3 *database;
	};
};