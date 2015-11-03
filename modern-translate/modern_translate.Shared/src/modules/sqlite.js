(function () {
    "use strict";

    var app = WinJS.Application;
    var sched = WinJS.Utilities.Scheduler;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    function runPromisesInSerial (promiseFunctions) {
        return promiseFunctions.reduce(function (promiseChain, nextPromiseFunction) {
            return promiseChain.then(nextPromiseFunction);
        },
        WinJS.Promise.wrap());
    }

    function executeAsTransactionAsync (database, workItemAsyncFunction) {
        return database.executeAsync("BEGIN TRANSACTION").then(workItemAsyncFunction).then(
            function (result) {
                var successResult = result;
                return database.executeAsync("COMMIT").then(function () {
                    return successResult;
                });
            },
            function (error) {
                var errorResult = error;
                return database.executeAsync("COMMIT").then(function () {
                    throw errorResult;
                });
            });
    }


    function executeStatementsAsTransactionAsync (database, statements) {
        var executeStatementPromiseFunctions = statements.map(function statementToPromiseFunction(statement) {
            return database.executeAsync.bind(database, statement);
        });

        return executeAsTransactionAsync(database, function () {
            return runPromisesInSerial(executeStatementPromiseFunctions);
        });
    }

    function bindAndExecuteStatementsAsTransactionAsync (database, statementsAndParameters) {
        var bindAndExecuteStatementPromiseFunctions = statementsAndParameters.map(function (statementAndParameter) {
            return database.bindAndExecuteAsync.bind(database, statementAndParameter.statement, statementAndParameter.parameters);
        });

        return executeAsTransactionAsync(database, function () {
            return runPromisesInSerial(bindAndExecuteStatementPromiseFunctions);
        });
    }

    function insertObject (database, table_name, obj) {
        return WinJS.Promise.as().then(function () {
            var parameters = [];

            var st1 = "(";
            var st2 = "(";
            var i = -1;
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var val = obj[key];
                    if (val == null) continue;
                    i++;
                    if (i > 0) {
                        st1 += ", ";
                        st2 += ",";
                    }
                    st1 += key;
                    st2 += "?";
                    if (typeof val != "string")
                        val = JSON.stringify(val);
                    obj[key] = val;
                    parameters.push(obj[key]);
                }
            }
            st1 += ")";
            st2 += ")";

            var statement = "INSERT INTO " + table_name + " " + st1 + " VALUES " + st2;

            return database.bindAndExecuteAsync(statement, parameters);
        }).then(function () {
            var statement = "SELECT last_insert_rowid();";
            return database.executeAsync(statement);
        }).then(function (x) {
            obj.id = x[0].getFirstValueByName("last_insert_rowid()");
            return obj;
        });

    }

    function entriestoObj (entries) {
        var obj = {};
        entries.forEach(function (entry) {
            obj[entry.name] = entry.value;
        });
        return obj;
    }

    function setupDatabase () {
        return SQLite.Database.openDatabaseInFolderAsync(Windows.Storage.ApplicationData.current.localFolder, "ft.db")
            .then(function (openedOrCreatedDatabase) {
                Custom.SQLite.localDatabase = openedOrCreatedDatabase;
                return Custom.SQLite.executeStatementsAsTransactionAsync(Custom.SQLite.localDatabase,
                    [
                        "CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, inputLang TEXT NOT NULL, outputLang TEXT NOT NULL, inputText TEXT NOT NULL, outputText TEXT NOT NULL, inputRoman TEXT, outputRoman TEXT, inputDict TEXT, outputDict TEXT, source TEXT NOT NULL);",
                        "CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, history_id INTEGER, inputLang TEXT NOT NULL, outputLang TEXT NOT NULL, inputText TEXT NOT NULL, outputText TEXT NOT NULL, inputRoman TEXT, outputRoman TEXT, inputDict TEXT, outputDict TEXT, source TEXT NOT NULL);",
                    ]
                );
            });
    }

     WinJS.Namespace.define("Custom.SQLite", {
        localDatabse: null,
        executeAsTransactionAsync: executeAsTransactionAsync,
        executeStatementsAsTransactionAsync: executeStatementsAsTransactionAsync,
        bindAndExecuteStatementsAsTransactionAsync: bindAndExecuteStatementsAsTransactionAsync,
        insertObject: insertObject,
        entriestoObj: entriestoObj,
        setupDatabase: setupDatabase
    });

})();
