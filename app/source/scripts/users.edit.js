/* globals Nanobar, Postleaf */
$(function() {
    'use strict';

    var progress = new Nanobar(),
        user = $('input[name="user"]').val();

    // Submit
    $('.user-form').on('submit', function(event) {
        var form = this,
            type = user === '' ? 'POST' : 'PUT',
            url = Postleaf.url(
                type === 'POST' ? 'api/users' : 'api/users/' + encodeURIComponent(user)
            );

        event.preventDefault();

        // Show progress
        progress.go(50);
        Postleaf.highlightErrors(form);

        // Send request
        $.ajax({
            url: url,
            type: type,
            data: $(form).serialize()
        })
        .done(function(res) {
            if(res.success) {
                // Redirect
                location.href = Postleaf.redirect;
            } else {
                // Show errors
                Postleaf.highlightErrors(form, res.invalid);
                $.alertable.alert(res.message);
            }
        })
        .always(function() {
            // Hide progress
            progress.go(100);
        });
    });

    // Open
    $('.open').on('click', function() {
        window.open( $(this).attr('data-url') );
    });

    // Delete
    $('.delete').on('click', function() {
        var user = $('input[name="user"]').val(),
            confirm = $(this).attr('data-confirm');

        // Confirmation
        $.alertable.confirm(confirm).then(function() {
            // Show progress
            progress.go(50);

            // Send request
            $.ajax({
                url: Postleaf.url('api/users/' + encodeURIComponent(user)),
                type: 'DELETE'
            })
            .done(function(res) {
                // Show feedback
                if(res.message) {
                    $.alertable.alert(res.message);
                }

                // Redirect
                if(res.success) {
                    location.href = Postleaf.redirect;
                }
            })
            .always(function() {
                // Hide progress
                progress.go(100);
            });
        });
    });

    // Submit button
    $('.submit').on('click', function() {
        $('.user-form').submit();
    });

    // Enforce slug syntax
    $('#username').on('change', function() {
        this.value = Postleaf.slug(this.value);
    });

    // Guess username when name changes
    $('#name').on('change', function() {
        var slug = Postleaf.slug(this.value);

        // Only guess if no username is present
        if($('#username').val() === '') {
            $('#username').val(slug);
        }
    });

    // Upload avatar
    $('.upload-avatar').on('change', 'input[type="file"]', function(event) {
        var input = this;
        if(!event.target.files.length) return;

        // Upload it
        Postleaf.upload({
            accept: 'image',
            image: {
                thumbnail: {
                    width: 512,
                    height: 512
                }
            },
            files: event.target.files[0],
            progress: function(percent) {
                progress.go(percent);
            }
        })
        .then(function(res) {
            // Reset the input
            $(input).replaceWith($(input).clone());

            // Update avatar
            if(res.uploaded.length) {
                $('input[name="avatar"]').val(res.uploaded[0].relative_path);
                $('.avatar .image').attr('src', res.uploaded[0].url).prop('hidden', false);
                $('.avatar .none').prop('hidden', true);
            }

            // Show feedback
            if(res.failed.length) {
                $.alertable.alert(res.failed[0].message);
            }
        });
    });

    // Upload cover
    $('.upload-cover').on('change', 'input[type="file"]', function(event) {
        var input = this;
        if(!event.target.files.length) return;

        // Upload it
        Postleaf.upload({
            accept: 'image',
            files: event.target.files[0],
            progress: function(percent) {
                progress.go(percent);
            }
        })
        .then(function(res) {
            // Reset the input
            $(input).replaceWith($(input).clone());

            // Update cover
            if(res.uploaded.length) {
                $('input[name="cover"]').val(res.uploaded[0].relative_path);
                $('.cover').css('background-image', 'url("' + res.uploaded[0].url + '")');
                $('.remove-cover').prop('hidden', false);
            }

            // Show feedback
            if(res.failed.length) {
                $.alertable.alert(res.failed[0].message);
            }
        });
    });

    // Remove cover
    $('.remove-cover').on('click', function() {
        $('input[name="cover"]').val('');
        $('.cover').css('background-image', 'none');
        $('.remove-cover').prop('hidden', true);
    });
});