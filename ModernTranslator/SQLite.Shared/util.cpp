#pragma once
#include "pch.h"
#include <string>
#include "util.h"
#include <sqlite3.h>

using namespace std;
using namespace Platform;

string PlatformStringToUtf8StdString(String ^textAsPlatformString)
{
	string textAsUtf8StdString = "";
	const wchar_t *textAsUtf16Wchar = textAsPlatformString->Data();
	const unsigned int textAsUtf16WcharLength = textAsPlatformString->Length();

	if (textAsUtf16WcharLength > 0) // If empty string or null then there's no need to call WideCharToMultiByte.
	{
		const int textAsUtf8CharLength = WideCharToMultiByte(CP_UTF8, 0, textAsUtf16Wchar, textAsUtf16WcharLength, nullptr, 0, nullptr, nullptr);

		if (textAsUtf8CharLength > 0)
		{
			textAsUtf8StdString.assign(textAsUtf8CharLength, '\0');
			if (WideCharToMultiByte(CP_UTF8, 0, textAsUtf16Wchar, textAsUtf16WcharLength, &textAsUtf8StdString[0], textAsUtf8CharLength, nullptr, nullptr) == 0)
			{
				throw ref new COMException(HRESULT_FROM_WIN32(GetLastError()), L"WideCharToMultiByte failure.");
			}
		}
		else
		{
			throw ref new COMException(HRESULT_FROM_WIN32(GetLastError()), L"WideCharToMultiByte failure.");
		}
	}

	return textAsUtf8StdString;
}

Platform::String ^Utf8StdStringToPlatformString(std::string textAsUtf8StdString)
{
	Platform::String ^textAsPlatformString;

	if (textAsUtf8StdString.length() > 0) // If the length is 0, no need to call MultiByteToWideChar to convert the empty string.
	{
		const int textAsUtf16WcharLength = MultiByteToWideChar(CP_UTF8, 0, textAsUtf8StdString.c_str(), static_cast<int>(textAsUtf8StdString.length()), nullptr, 0);

		if (textAsUtf16WcharLength > 0)
		{
			wstring textAsUtf16StdString;
			textAsUtf16StdString.assign(textAsUtf16WcharLength, '\0');
			if (MultiByteToWideChar(CP_UTF8, 0, textAsUtf8StdString.c_str(), static_cast<int>(textAsUtf8StdString.length()), &textAsUtf16StdString[0], textAsUtf16WcharLength) >= 0)
			{
				textAsPlatformString = Platform::StringReference(textAsUtf16StdString.c_str(), textAsUtf16StdString.length());
			}
			else
			{
				throw ref new COMException(HRESULT_FROM_WIN32(GetLastError()), L"MultiByteToWideChar failure.");
			}
		}
		else
		{
			throw ref new COMException(HRESULT_FROM_WIN32(GetLastError()), L"MultiByteToWideChar failure.");
		}
	}

	return textAsPlatformString;
}

// Passes through successful SQLite result values and for failures throws.
// See <http://www.sqlite.org/c3ref/c_abort.html>
unsigned int ValidateSQLiteResult(const unsigned int sqliteResult)
{
	switch (sqliteResult)
	{
	case SQLITE_OK:
	case SQLITE_ROW:
	case SQLITE_DONE:
		break;

	case SQLITE_ERROR:
		throw ref new FailureException(L"SQL error or missing database");
		break;

	case SQLITE_INTERNAL:
		throw ref new FailureException(L"Internal logic error in SQLite");
		break;

	case SQLITE_PERM:
		throw ref new FailureException(L"Access permission denied");
		break;

	case SQLITE_ABORT:
		throw ref new FailureException(L"Callback routine requested an abort");
		break;

	case SQLITE_BUSY:
		throw ref new FailureException(L"The database file is locked");
		break;

	case SQLITE_LOCKED:
		throw ref new FailureException(L"A table in the database is locked");
		break;

	case SQLITE_NOMEM:
		throw ref new FailureException(L"A malloc() failed");
		break;

	case SQLITE_READONLY:
		throw ref new FailureException(L"Attempt to write a readonly database");
		break;

	case SQLITE_INTERRUPT:
		throw ref new FailureException(L"Operation terminated by sqlite3_interrup");
		break;

	case SQLITE_IOERR:
		throw ref new FailureException(L"Some kind of disk I/O error occurred");
		break;

	case SQLITE_CORRUPT:
		throw ref new FailureException(L"The database disk image is malformed");
		break;

	case SQLITE_NOTFOUND:
		throw ref new FailureException(L"Unknown opcode in sqlite3_file_control()");
		break;

	case SQLITE_FULL:
		throw ref new FailureException(L"Insertion failed because database is full");
		break;

	case SQLITE_CANTOPEN:
		throw ref new FailureException(L"Unable to open the database file");
		break;

	case SQLITE_PROTOCOL:
		throw ref new FailureException(L"Database lock protocol error");
		break;

	case SQLITE_EMPTY:
		throw ref new FailureException(L"Database is empty");
		break;

	case SQLITE_SCHEMA:
		throw ref new FailureException(L"The database schema changed");
		break;

	case SQLITE_TOOBIG:
		throw ref new FailureException(L"String or BLOB exceeds size limit");
		break;

	case SQLITE_CONSTRAINT:
		throw ref new FailureException(L"Abort due to constraint violation");
		break;

	case SQLITE_MISMATCH:
		throw ref new FailureException(L"Data type mismatch");
		break;

	case SQLITE_MISUSE:
		throw ref new FailureException(L"Library used incorrectly");
		break;

	case SQLITE_NOLFS:
		throw ref new FailureException(L"Uses OS features not supported on host");
		break;

	case SQLITE_AUTH:
		throw ref new FailureException(L"Authorization denied");
		break;

	case SQLITE_FORMAT:
		throw ref new FailureException(L"Auxiliary database format error");
		break;

	case SQLITE_RANGE:
		throw ref new FailureException(L"2nd parameter to sqlite3_bind out of range");
		break;

	case SQLITE_NOTADB:
		throw ref new FailureException(L"File opened that is not a database file");
		break;

	case SQLITE_NOTICE:
		throw ref new FailureException(L"Notifications from sqlite3_log()");
		break;

	case SQLITE_WARNING:
		throw ref new FailureException(L"Warnings from sqlite3_log()");
		break;

	default:
		throw ref new Exception(E_UNEXPECTED, L"Unknown sqlite3 result.");
		break;
	}

	return sqliteResult;
}