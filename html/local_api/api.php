<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//we have to get the db scheme:
//we have to run the final query 
header('Content-Type: application/json');
header('Access-Control-Allow-Headers: *');

//depedencies php curl, php mysql
if($_SERVER['REQUEST_METHOD'] === "OPTIONS"){
    return;
}

if($_SERVER['REQUEST_METHOD'] == "POST"){
    $data = json_decode(file_get_contents('php://input'));
    $ceo_query=$data->query;

   $hostname = getenv("MYSQL_HOST");
   $username =getenv("MYSQL_USER");
   $password = getenv("MYSQL_PASSWORD");
   $db_name  = getenv("MYSQL_DATABASE");

    try{
        $conn = new mysqli($hostname, $username, $password,$db_name);

   } catch (\Throwable $th) {
        $r=new \StdClass();
        $r->error="Can't connect to your database getting the error(".$th->getMessage()."), make sure you setup database connection details when installing. See instructions:https://www.chatgptreports.com/";
        echo json_encode($r);
        die;
    }

        $query="SHOW TABLES";
        $results=fetch($query,$conn);
        $tables=[];
        foreach($results as $k=>$table_name){
          $tname=$table_name[array_key_first($table_name)];

          $desc=fetch("SHOW CREATE TABLE $tname",$conn);
          $tables[]=array(
              "name"=>$tname,
              "create"=>$desc[0]['Create Table']
          );
        }
    $postData=new \StdClass();
    $postData->tables=$tables;
    $postData->ceo_query=$ceo_query;
    $postData->db_name=$db_name;

    $url="https://www.chatgptreports.com/api/process.php";
    $rData= post($url,json_encode($postData));
    $actionResult=json_decode($rData);  

    try{
        $rows=fetch($actionResult->query,$conn);
        $r=new \StdClass();
        $r->results_table=$rows;
        $r->query=$actionResult->query;
        $r->messages=[];
        echo json_encode($r);

    } catch (\Throwable $th) {
        $r=new \StdClass();
        $r->error="Sorry, we had trouble figuring out this report, maybe try something a little more simple for now";
        $r->query=$actionResult->query;
        echo json_encode($r);
    }
    
}


function post($url,$data=''){
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json',
                'Content-Length: ' . strlen($data),
    ));
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}



function fetch($query,$conn){
    $stmt = $conn->query($query);
    $results = $stmt->fetch_all(MYSQLI_ASSOC);
    return $results;
}

