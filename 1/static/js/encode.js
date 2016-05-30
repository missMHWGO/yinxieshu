;
(function(win) {
    var index = {
        init: function() {
            this.bind();
        },
        bind: function() {
            //最大隐藏长度
            var max = 1000;
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');

            alert("隐藏信息请选择一张图片并填写隐藏内容和密码，提取信息请选择一张隐藏了信息的图片并填写提取密码！");

            $("#hide")[0].onclick = encode;
            $("#getting")[0].onclick = decode;

            $("#choose")[0].onclick = function() {
                $("#file").click();

                $('#file').change(function(e) {
                    var file = e.target.files[0],
                        imageType = /image.*/;

                    if (!file.type.match(imageType)) {
                        alert('请选择一张图片！');
                        return;
                    }

                    //读取文件
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        $("#img_encode")[0].style.display = "block";
                        $("#img_encode")[0].src = e.target.result;

                        //清空数据
                        $("#content_encode").val('');
                        $("#password_encode").val('');
                        $("#password_decode").val('');
                        $("#content_decode").val('');

                        var img = new Image();
                        img.onload = function() {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx.drawImage(img, 0, 0);
                        }
                        img.src = e.target.result;
                    }
                    reader.readAsDataURL(e.target.files[0]);
                });
            }


            function encode() {
                var content_encode = $("#content_encode").val();
                var password_encode = $("#password_encode").val();
                var img_decode = $("#img_decode")[0];

                //给消息加密
                if (password_encode.length > 0) {
                    content_encode = sjcl.encrypt(password_encode, content_encode);
                } else {
                    content_encode = JSON.stringify({ 'text': content_encode });
                }

                //消息长度超过了图片可隐藏的长度
                var pixelCount = canvas.width * canvas.height;
                if ((content_encode.length + 1) * 16 > pixelCount * 3) {
                    alert('消息长度超过了图片可隐藏的长度！');
                    return;
                }

                //消息长度超过max
                if (content_encode.length > max) {
                    alert('消息太长！');
                    return;
                }

                //获取像素值，隐藏消息
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                encodeMessage(imgData.data, sjcl.hash.sha256.hash(password_encode), content_encode);
                ctx.putImageData(imgData, 0, 0);

                var image = canvas.toDataURL();
                $.post("./img.php", {
                    'image': image
                }).done(function(data) {
                    alert('消息已经隐藏到图片中，扫码查看图片中隐藏的内容！');
                    document.getElementById('encode').style.display = "none";
                    document.getElementById('share').style.display = "block";
                    document.getElementById('code').style.display = "block";
                });
            }

            function decode() {
                var password_decode = $('#password_encode').val();

                //提取内容             
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var message = decodeMessage(imgData.data, sjcl.hash.sha256.hash(password_decode));

                var obj = null;
                try {
                    obj = JSON.parse(message);
                } catch (e) {
                    if (password_decode.length > 0) {
                        alert('提取密码不正确，请重新输入！');
                    }
                }

                if (obj) {
                    if (obj.ct) {
                        try {
                            obj.text = sjcl.decrypt(password_decode, message);
                        } catch (e) {
                            alert('提取密码不正确，请重新输入！');
                        }
                    }

                    $('#content_encode').val(obj.text);
                    if(obj.text==""){
                        alert("该图片没有隐含任何内容！");
                    }
                }
            }

            //获得number的location位的数字，返回的是1Bit
            var getBit = function(number, location) {
                return ((number >> location) & 1);
            };

            //将Number的location位换成Bit
            var setBit = function(number, location, bit) {
                return (number & ~(1 << location)) | (bit << location);
            };

            //将number转换成二进制并将每位保存在数组中
            var getBitsFromNumber = function(number) {
                var bits = [];
                for (var i = 0; i < 16; i++) {
                    bits.push(getBit(number, i));
                }
                return bits;
            };

            //将图片中隐藏的bit提取出来重新组合成数字
            var getNumberFromBits = function(bytes, history, hash) {
                var number = 0,
                    pos = 0;
                while (pos < 16) {
                    var loc = getNextLocation(history, hash, bytes.length);
                    var bit = getBit(bytes[loc], 0);
                    number = setBit(number, pos, bit);
                    pos++;
                }
                return number;
            };

            //将每个字符的unicode编码转换成二进制并连接起来保存在数组中
            var getMessageBits = function(message) {
                var messageBits = [];
                for (var i = 0; i < message.length; i++) {
                    var code = message.charCodeAt(i);
                    messageBits = messageBits.concat(getBitsFromNumber(code));
                }
                return messageBits;
            };

            //获取下一个应该存放的位子
            var getNextLocation = function(history, hash, total) {
                var pos = history.length;
                var loc = Math.abs(hash[pos % hash.length] * (pos + 1)) % total;
                while (true) {
                    if (loc >= total) {
                        loc = 0;
                    } else if (history.indexOf(loc) >= 0) {
                        loc++;
                    } else if ((loc + 1) % 4 === 0) {
                        loc++;
                    } else {
                        history.push(loc);
                        return loc;
                    }
                }
            };

            //隐藏消息
            var encodeMessage = function(colors, hash, message) {
                //将消息长度也编码进去
                var messageBits = getBitsFromNumber(message.length);
                messageBits = messageBits.concat(getMessageBits(message));

                //存贮已经用过的位子
                var history = [];

                var pos = 0;
                while (pos < messageBits.length) {
                    var loc = getNextLocation(history, hash, colors.length);
                    colors[loc] = setBit(colors[loc], 0, messageBits[pos]);

                    //将alpha通道的值设为255
                    while ((loc + 1) % 4 !== 0) {
                        loc++;
                    }
                    colors[loc] = 255;

                    pos++;
                }
            };

            //获取消息
            var decodeMessage = function(colors, hash) {
                var history = [];

                //获取消息长度
                var messageSize = getNumberFromBits(colors, history, hash);

                if ((messageSize + 1) * 16 > colors.length * 0.75) {
                    return '';
                }

                if (messageSize === 0 || messageSize > max) {
                    return '';
                }

                //提取消息
                var message = [];
                for (var i = 0; i < messageSize; i++) {
                    var code = getNumberFromBits(colors, history, hash);
                    message.push(String.fromCharCode(code));
                }

                //将消息变成字符串
                return message.join('');
            };

        }
    }
    index.init();
})(window);
