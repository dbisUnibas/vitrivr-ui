<?php
/* functions */

function queryAPI($jsonQuery) {
	$service_port = 12345;
	$address = "localhost";

	$msg = "{\n   \"array\": [\n";
	echo $msg;
	
	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	if ($socket === false) {
		die('{"type" : "error", "msg" : "connection error: ' . socket_strerror(socket_last_error()) . '"}]}');
	}

	$result = socket_connect($socket, $address, $service_port);
	if ($result === false) {
		die('{"type" : "error", "msg" : "connection error: ' . socket_strerror(socket_last_error($socket)) . '"}]}');
	}

	$in = stripslashes($jsonQuery);
	socket_write($socket, $in, strlen($in));
	socket_write($socket, ';', 1);

	

	$buffer = "";
	while ($out = socket_read($socket, 2048)) {
		echo $out;
		ob_flush();
		flush();
	}

	#JSON Array end
	$msg = "]\n }";
	echo $msg;
	echo PHP_EOL;
	ob_flush();
	flush();
	socket_close($socket);

}

/* actual logic */
error_reporting(0);

if (!empty($_POST)) {
	try {
		$queryObject = json_decode(stripslashes($_POST['query']));

		if ($queryObject -> queryType == 'multiSketch') {

			foreach ($queryObject->query as $currentQuery) {
				//prepare image for Java
				if (isset($currentQuery -> img)) {
					$currentQuery -> img = str_replace(' ', '+', $currentQuery -> img);
					$currentQuery -> img = str_replace("\n", '', $currentQuery -> img);
				}
			}

			$json = json_encode($queryObject);
			queryAPI($json);

		} else {
			$json = json_encode($queryObject);
			queryAPI($json);

		}
	} catch (Exception $e) {

		die( '{ "type":"error", "msg" : "' . $e -> getMessage() . '"}]}"');
		
	}

}
?>
