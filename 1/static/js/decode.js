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
            var id_hid = $('#id_hid').html();

            $.get("./get.php?id="+id_hid).done(function(data) {
                $("#img_decode")[0].src = data;
                var img = new Image();
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                }
                img.src = data;
            });

            $("#get")[0].onclick = decode;

            function decode() {
                var password_decode = $('#password_decode').val();

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

                    $('#content_decode').val(obj.text);
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
