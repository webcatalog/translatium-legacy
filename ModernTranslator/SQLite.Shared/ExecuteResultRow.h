#pragma once

namespace SQLite
{
	ref class Database;
	ref class ExecuteResultRow;
	ref class ColumnEntry;

	public ref class ColumnEntry sealed
	{
	public:
		virtual ~ColumnEntry() { }

		property Platform::String ^Name
		{
			Platform::String ^get() { return this->name; }
		}

		property Platform::String ^Value
		{
			Platform::String ^get() { return this->value; }
		}

	private:
		ColumnEntry(
			Platform::String ^value,
			Platform::String ^name) : value(value), name(name) { }

		friend ref class ExecuteResultRow;

		Platform::String ^value;
		Platform::String ^name;
	};

	public ref class ExecuteResultRow sealed
	{
	public:
		virtual ~ExecuteResultRow();

		Platform::String^ GetFirstValueByName(Platform::String ^name);

		property Windows::Foundation::Collections::IVector<ColumnEntry^> ^Entries
		{
			Windows::Foundation::Collections::IVector<ColumnEntry^> ^get() { return this->entries; }
		};

	private:
		ExecuteResultRow(int columnCount, char **valuesAsUtf8Char, char **namesAsUtf8Char);
		ExecuteResultRow();

		void Add(const char *valueAsUtf8Char, const char *nameAsUtf8Char);

		friend ref class Database;

		Platform::Collections::Vector<ColumnEntry^> ^entries;
	};
};