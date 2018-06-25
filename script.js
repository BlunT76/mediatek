// Do all this when the page has loaded
$(document).ready(function () {
    // Get the data from the API
    $.getJSON("https://www.googleapis.com/books/v1/volumes?q=isbn:9781909679368", displayBooks);

    // We've got the JSON data. Now let's do something with it
    function displayBooks(data) {
        console.log(data)
        // Start off by defining a variable called htmlString
        var htmlString = "<div>";
        // For each of the JSON API results... 
        $.each(data.items, function (i, item) {
            // Add some HTML with CSS
            
            // Build up the HTML using the data from the API
            htmlString += '<img src="' + item.volumeInfo.imageLinks.thumbnail + '" alt="' + item.id + '" title="' + item.id + '", class ="img-thumbnail img-responsive"/><br/>';
            htmlString += '<strong class="small">Pub: ' + item.volumeInfo.publishedDate + '</strong></div>';
            htmlString += '<div class="col-xs-9"><h1>' + item.volumeInfo.title + '</h1>';
            $.each(item.volumeInfo.authors, function (i, author) {
                htmlString += '<p class="bg-info"><i>' + author + '</i></p>';
            });
            htmlString += '<p class="small">' + item.volumeInfo.description + '</p>';
            htmlString += '<p class="well small">Extract: "' + item.searchInfo.textSnippet + '"<a href="' + item.accessInfo.webReaderLink + '" target="_blank"> Read more</a></p>';
            htmlString += '</div>';
        });
        // And then wherever there's a div with an ID of 'book' in the HTML, replace it with our htmlString. See over on the right for the results!     
        $('#book').html(htmlString + "</div>");
    }
});