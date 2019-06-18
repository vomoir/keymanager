//Test for browser compatibility
if (window.openDatabase) {
  var mydb = openDatabase("db_keys", "0.1", "Key Distribution", 5 * 1024 * 1024);
  if (mydb){
    mydb.transaction(function (t) {
      t.executeSql('CREATE TABLE IF NOT EXISTS tb_keys ("id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "key_uid"	TEXT, "date_issed"	TEXT, "date_returned"	TEXT, "issued_to"	INTEGER)', []);
      t.executeSql('CREATE TABLE IF NOT EXISTS tb_key_user ("id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "fName"	TEXT, "lName"	TEXT)', []);
    });        
  }
  if (mydb) {
    mydb.transaction(function (t) {
      t.executeSql("SELECT * FROM tb_keys ", [], _checkData);
    });
    outputItems(_updateList);
  }
} else {
  alert("WebSQL is not supported by your browser!");
}

function _checkData(transaction, results) {
  //populate tb_keys with some data for testing purposes
  console.log(results.rows.length);
  if(results.rows.length < 1){
    transaction.executeSql('INSERT INTO tb_keys("key_uid","date_issued","date_returned","issued_to") VALUES ("TYZ","20190604", "", 1);');
    transaction.executeSql('INSERT INTO tb_key_user ("fName", "lName") VALUES ("Myles", "Hobson");');
  }
}

$('#issuedTo').keypress(function (event) {
  if (event.keyCode == 13) {
    addItem();
  }
});

//function to get the list of existing items from the database
//cbfunc parameter is the callback function to run on completion (usually _updateList()):
function outputItems(cbfunc) {
  //check to ensure the mydb object has been created
  if (mydb) {
    mydb.transaction(function (t) {
      t.executeSql("SELECT key_uid, date_issued, issued_to FROM tb_keys  order by date_issued", [], cbfunc);
    });
  } else {
    alert("db not found, your browser does not support web sql!");
  }
}

//function to output the list of items in the database
function _updateList(transaction, results) {
  //initialise the listitems variable
  var listitems = "";
  var listholder = document.getElementById("itemlist");
  //clear list ul
  listholder.innerHTML = "";
  $('#itemlist').empty();
  var i;

  //Iterate through the results
  for (i = 0; i < results.rows.length; i++) {
    //Get the current row
    var row = results.rows.item(i);
    //add listitem with column attribute so it splits
    listholder.innerHTML += "<li class='list-group-item col-xs-6 playerList'> Key: " + row.key_uid + ", Issued to " + row.issued_to + " <a href='javascript:void(0);' class='btn btn-danger btn-xs pull-right' style='margin-top: -7px' onclick='deleteItem(" + row.id + ");'>Delete</a>";
  }
  console.log("Added " + i + " rows to #itemlist");
  $("#itemCnt").val(i);
}

function addItem() {
  pId = 0;
  //check to ensure the mydb object has been created
  if (mydb) {
    //get the values of the make and model text inputs
    var keyUid = $("#keyDetails").val();
    var dateIssued = $("#dateIssued").val();
    var issuedTo = $("#issuedTo").val();
    //Test to ensure that the user has entered both a name
    if (keyUid !== "") {
      //Insert the user entered details into the todo list table, note the use of the ? placeholder, 
      //these will replaced by the data passed in as an array as the second parameter
      mydb.transaction(function (t) {
        t.executeSql('INSERT INTO tb_keys ("key_uid","date_issed","issued_to") VALUES (?,?,?)',[keyUid,dateIssued,issuedTo]);
        outputItems(_updateList);
      });
    } else {
      alert("You must enter a to do item's details!");
    }
  } else {
    alert("db not found, your browser does not support web sql!");
  }
  $("#whattodo").val("");
}

//function to remove a player from the database, passed the row id as it's only parameter
function deleteItem(id) {
  //check to ensure the mydb object has been created
  if (mydb) {
    mydb.transaction(function (t) {
      t.executeSql("DELETE FROM tb_todo WHERE id=?", [id], outputItems(_updateList));
    });
  } else {
    alert("db not found, your browser does not support web sql!");
  }
  outputItems(_updateList);
}

var resCnt = 0;
