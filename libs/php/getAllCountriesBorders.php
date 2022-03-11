<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true) / 1000;

$string =  file_get_contents(__DIR__. "/../js/json/countryBorders.json");

$json = json_decode($string);
$features = $json->features;

$country_code = $_GET['country_code'];

$output_geom = "";
for($i=0;$i<count($features);$i++){
    $feature = $features[$i];
    if($feature->properties->iso_a2 == $country_code){
        $output_geom = $feature->geometry;
    }
}
print_r(json_encode($output_geom));



?>