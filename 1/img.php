<?php
$image = $_POST['image'];
$img = str_replace('data:image/png;base64,', '', $image);
$data = base64_decode($img);

$stor = new SaeStorage();
$bucket = 'yinxieshu';

$img_len = $stor->getFilesNum($bucket,"/");
$i = $img_len/2 + 1;
$filename_txt = 'image_'.$i.'.txt';
$filename_png = 'image_'.$i.'.png';
$stor->write($bucket , $filename_txt , $image);
$stor->write($bucket , $filename_png , $data);
?>