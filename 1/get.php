<?php
$id = $_GET['id'];

$stor = new SaeStorage();
$bucket = 'yinxieshu';

//$img_len = $stor->getFilesNum($bucket,"/");
//$max = $img_len/2;
//$i = rand(1,$max);
$filename = 'image_'.$id.'.txt';
echo($stor->read($bucket , $filename));
?>