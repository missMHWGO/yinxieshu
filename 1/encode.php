<?php
$stor = new SaeStorage();
$bucket = 'yinxieshu';

$img_len = $stor->getFilesNum($bucket,"/");
$max_1 = $img_len/2+1;
//$i = rand(1,$max);
//$filename = 'image_'.$max.'.txt';
//echo($stor->read($bucket , $filename));
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>隐写术</title>
</head>

<body>
    <div id="encode" class="container">
        <div class="left">
            <h1 class="title">隐藏或提取</h1>
            <input type="button" id="choose" class="button" value="选择图片">
            <input type="file" id="file" class="hidden">
            <textarea name="content_encode" id="content_encode" class="content" cols="30" rows="10" placeholder="请输入您要隐藏的内容"></textarea>
            <input type="text" id="password_encode" class="password" placeholder="请输入您的密码">
            <input type="button" id="hide" class="button" value="隐藏">
            <input type="button" id="getting" class="button" value="提取">
        </div>
        <div class="right">
            <img id="img_encode" class="img hidden">
        </div>
    </div>
    <!-- <img src="static/img/code.png" id="code" alt="二维码"> -->
    <p id="share" class="hidden">点击或分享链接查看图片中隐藏了什么信息~=。=~</p>
    <a id="code" class="hidden" href="http://yinxieshu1.applinzi.com/decode.php?id=<?php echo $max_1;?>">http://yinxieshu1.applinzi.com/decode.php?id=<?php echo $max_1;?></a>
    <canvas id="canvas" class="hidden"></canvas>

    <link href='static/css/style.css' type='text/css' rel='stylesheet'/>
    <script type="text/javascript" src="static/js/jquery-2.1.3.min.js"></script>
    <script type='text/javascript' src='static/js/sjcl.js'></script>
    <script type='text/javascript' src='static/js/encode.js'></script>
</body>

</html>
