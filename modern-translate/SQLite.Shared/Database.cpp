#include "pch.h"

using namespace SQLite;
using namespace Platform;
using namespace Platform::Collections;
using namespace std;
using namespace Concurrency;
using namespace Windows;
using namespace Windows::Foundation::Collections;

Windows::Foundation::IAsyncOperation<Database^> ^Database::OpenDatabaseInFolderAsync(Windows::Storage::StorageFolder ^databaseFolder, Platform::String ^databaseFileName)
{
	return create_async([databaseFolder, databaseFileName]() -> Database^
	{
		Database ^database = ref new Database();
		string databasePath = PlatformStringToUtf8StdString(databaseFolder->Path);
		databasePath += "\\";
		databasePath += PlatformStringToUtf8StdString(databaseFileName);
		
		database->OpenPath(databasePath);
		return database;
	});
}

Database::~Database()
{
	CloseDatabase();
}

void Database::CloseDatabase()
{
	if (this->database != nullptr)
	{
		ValidateSQLiteResult(sqlite3_close(this->database));
		this->database = nullptr;
	}
}

struct SQLiteExecCallbackContext
{
	Windows::Foundation::Collections::IVector<ExecuteResultRow^> ^rows;
	Concurrency::progress_reporter<SQLite::ExecuteResultRow^> reporter;
};

Windows::Foundation::IAsyncOperationWithProgress<Windows::Foundation::Collections::IVector<ExecuteResultRow^>^, ExecuteResultRow^> ^Database::ExecuteAsync(Platform::String ^statementAsString)
{
	sqlite3 *database = this->database;
	
	return create_async([database, statementAsString](Concurrency::progress_reporter<SQLite::ExecuteResultRow^> reporter) -> Windows::Foundation::Collections::IVector<ExecuteResultRow^>^
	{
		SQLiteExecCallbackContext context = {ref new Vector<ExecuteResultRow^>(), reporter};
		ValidateSQLiteResult(sqlite3_exec(database, PlatformStringToUtf8StdString(statementAsString).c_str(), Database::SQLiteExecCallback, reinterpret_cast<void*>(&context), nullptr));
		return context.rows;
	});
}

Windows::Foundation::IAsyncOperationWithProgress<Windows::Foundation::Collections::IVector<ExecuteResultRow^>^, ExecuteResultRow^> ^Database::BindAndExecuteAsync(Platform::String ^statementAsString, Windows::Foundation::Collections::IVector<Platform::String^> ^parameterValuesAsPlatformVector)
{
	sqlite3 *database = this->database;

	// Create our own copy of the parameters because the IVector provided isn't accessible on other threads.
	std::vector<Platform::String^> parameterValues;
	for (unsigned int index = 0; index < parameterValuesAsPlatformVector->Size; ++index)
	{
		parameterValues.push_back(parameterValuesAsPlatformVector->GetAt(index));
	}

	return create_async([database, statementAsString, parameterValues](Concurrency::progress_reporter<SQLite::ExecuteResultRow^> reporter) -> Windows::Foundation::Collections::IVector<ExecuteResultRow^>^
	{
		IVector<ExecuteResultRow^> ^results = ref new Vector<ExecuteResultRow^>();
		sqlite3_stmt *statement = nullptr;

		ValidateSQLiteResult(sqlite3_prepare(database, PlatformStringToUtf8StdString(statementAsString).c_str(), -1, &statement, nullptr));

		const size_t parameterValuesLength = parameterValues.size();
		for (unsigned int parameterValueIndex = 0; parameterValueIndex < parameterValuesLength; ++parameterValueIndex)
		{
			// Bind parameters are indexed by 1.
			ValidateSQLiteResult(sqlite3_bind_text(statement, parameterValueIndex + 1, PlatformStringToUtf8StdString(parameterValues[parameterValueIndex]).c_str(), -1, SQLITE_TRANSIENT));
		}

		int stepResult = SQLITE_ROW;
		while (stepResult != SQLITE_DONE)
		{
			stepResult = ValidateSQLiteResult(sqlite3_step(statement));
			if (stepResult == SQLITE_ROW)
			{
				const int columnCount = sqlite3_column_count(statement);
				ExecuteResultRow ^currentRow = ref new ExecuteResultRow();

				for (int columnIndex = 0; columnIndex < columnCount; ++columnIndex)
				{
					currentRow->Add(reinterpret_cast<const char*>(sqlite3_column_text(statement, columnIndex)), sqlite3_column_name(statement, columnIndex));
				}

				results->Append(currentRow);
				reporter.report(currentRow);
			}
		}

		ValidateSQLiteResult(sqlite3_finalize(statement));

		return results;
	});
}

Database::Database() : database(nullptr)
{
}

void Database::EnsureInitializeTemporaryPath()
{
	if (sqlite3_temp_directory == nullptr)
	{
		string temporaryPath = PlatformStringToUtf8StdString(Windows::Storage::ApplicationData::Current->TemporaryFolder->Path);
		sqlite3_temp_directory = sqlite3_mprintf("%s", temporaryPath.c_str());
	}
}

void Database::OpenPath(const string &databasePath)
{
	// Per SQLite documentation, for Windows modern applications we must initialize temporary path before calling open.
	// See <http://www.sqlite.org/c3ref/temp_directory.html>
	EnsureInitializeTemporaryPath();
	ValidateSQLiteResult(sqlite3_open_v2(databasePath.c_str(), &this->database, SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE, nullptr));
}

int Database::SQLiteExecCallback(void *contextAsVoid, int columnCount, char **columnNames, char **columnValues)
{
	SQLiteExecCallbackContext *context = reinterpret_cast<decltype(context)>(contextAsVoid);
	ExecuteResultRow ^row = ref new ExecuteResultRow(columnCount, columnNames, columnValues);

	context->rows->Append(row);
	context->reporter.report(row);

	return 0;
}
