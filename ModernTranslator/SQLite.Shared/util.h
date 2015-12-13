#pragma once

std::string PlatformStringToUtf8StdString(Platform::String ^textAsPlatformString);
Platform::String ^Utf8StdStringToPlatformString(std::string textAsUtf8StdString);
unsigned int ValidateSQLiteResult(const unsigned int sqliteResult);