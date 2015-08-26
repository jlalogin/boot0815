define(['jquery', './uploader_template'], function($, template) {
    console.log('uploader init...');

    return {
        init: function(id) {
            this.render(id);
        },

        render: function(attach_id) {
            var container = $('#' + attach_id);

            console.dir(container);

            var htmlString = template.htmlString.replace(/\{x\}/g, attach_id);
            container.html(htmlString);

            var uploadButton = $("button", container)[0];

            uploadButton.addEventListener('click', this.handleUpload.bind(null, attach_id));
        },

        handleUpload: function(attach_id, e) {
            e.preventDefault();

            var container = $('#' + attach_id);

            var fileInput = $('#uploadFile_' + attach_id, container)[0];

            var fd = new FormData();

            for (var x=0; x<fileInput.files.length; x++) {
                console.log('uploading ' + fileInput.files[x].name);

                fd.append("files", fileInput.files[x]);
            }

            $.ajax('/api/upload', {
                method: 'POST',
                data: fd,
                processData: false,
                contentType: false,
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();

                    // upload progress
                    xhr.upload.addEventListener("progress", function(e){
                        console.log('progressing...')
                        var uploadProgress = $('#uploadProgress_' + attach_id, container)[0];

                        uploadProgress.setAttribute('max', e.total);
                        uploadProgress.setAttribute('value', e.loaded);
                    }, false);

                    return xhr;
                }
            }).then(function(e) {
                console.log('File Uploaded!');
            }, function(e) {
                console.log('Upload Failed');
            });

            // var xhr = new XMLHttpRequest();
            //
            // xhr.upload.addEventListener('progress', function(e) {
            //     console.log('progressing...')
            //     var uploadProgress = $('#uploadProgress', container)[0];
            //
            //     uploadProgress.setAttribute('max', e.total);
            //     uploadProgress.setAttribute('value', e.loaded);
            // });
            //
            // xhr.addEventListener('readystatechange', function(e) {
            //     if(xhr.readyState === 4 && xhr.status === 200) {
            //         console.log('file transferred!');
            //     }
            // });
            //
            // xhr.open('POST', '/api/upload');
            // xhr.send(fd);
        }
    };
});
