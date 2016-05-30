<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>隐写术</title>
</head>

<body>
    <div id="decode" class="container">
        <div class="left">
            <h1 class="title">提取</h1>
            <img id="img_decode" class="img">
        </div>
        <div class="right">
            <input type="text" id="password_decode" class="password" placeholder="请输入提取密码">
            <input type="button" id="get" class="button" value="提取">
            <textarea name="content_decode" id="content_decode" class="content" cols="30" rows="10" placeholder="图片里面到底隐藏了什么东西呢。。。"></textarea>
        </div>
    </div>
    <p id="id_hid" class="hidden"><?php echo $_GET['id'];?></p>
    <canvas id="canvas" class="hidden"></canvas>

    <link href='static/css/style.css' type='text/css' rel='stylesheet'/>
    <script type="text/javascript" src="static/js/jquery-2.1.3.min.js"></script>
    <script type='text/javascript' src='static/js/sjcl.js'></script>
    <script type='text/javascript' src='static/js/decode.js'></script>
</body>

</html>