#include "pch.h"

using namespace SQLite;
using namespace Platform;
using namespace Platform::Collections;
using namespace std;
using namespace Concurrency;
using namespace Windows;
using namespace Windows::Foundation::Collections;

ExecuteResultRow::~ExecuteResultRow()
{
	delete this->entries;
	this->entries = nullptr;
}

Platform::String^ ExecuteResultRow::GetFirstValueByName(Platform::String ^name)
{
	const unsigned int entriesSize = this->entries->Size;
	Platform::String ^firstValue = nullptr;

	for (unsigned int entryIndex = 0; entryIndex < entriesSize && firstValue == nullptr; ++entryIndex)
	{
		ColumnEntry ^entry = this->entries->GetAt(entryIndex);
		if (entry->Name == name)
		{
			firstValue = entry->Value;
		}
	}
	return firstValue;
}

ExecuteResultRow::ExecuteResultRow(int columnCount, char **valuesAsUtf8Char, char **namesAsUtf8Char) : entries(nullptr)
{
	this->entries = ref new Vector<ColumnEntry^>();
	for (int columnIndex = 0; columnIndex < columnCount; ++columnIndex)
	{
		this->entries->Append(ref new ColumnEntry(
			Utf8StdStringToPlatformString(valuesAsUtf8Char[columnIndex]),
			Utf8StdStringToPlatformString(namesAsUtf8Char[columnIndex])));
	}
}

ExecuteResultRow::ExecuteResultRow()
{
	this->entries = ref new Vector<ColumnEntry^>();
}

void ExecuteResultRow::Add(const char *valueAsUtf8Char, const char *nameAsUtf8Char)
{
	this->entries->Append(ref new ColumnEntry(Utf8StdStringToPlatformString(valueAsUtf8Char), Utf8StdStringToPlatformString(nameAsUtf8Char)));
}
