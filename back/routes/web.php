<?php

$router->register('getUsers', 'User', 'getUsers');
$router->register('newUser', 'User', 'newUser');
$router->register('removeUser', 'User', 'removeUser');
$router->register('updateUser', 'User', 'updateUser');
$router->register('registerUser', 'User', 'registerUser');

$router->register('getAuthors', 'Author', 'getAuthors');
$router->register('newAuthor', 'Author', 'newAuthor');
$router->register('removeAuthor', 'Author', 'removeAuthor');
$router->register('updateAuthor', 'Author', 'updateAuthor');

$router->register('getCategories', 'Category', 'getCategories');
$router->register('newCategory', 'Category', 'newCategory');
$router->register('removeCategory', 'Category', 'removeCategory');
$router->register('updateCategory', 'Category', 'updateCategory');

$router->register('getBooks', 'Book', 'getBooks');
$router->register('newBook', 'Book', 'newBook');
$router->register('removeBook', 'Book', 'removeBook');
$router->register('updateBook', 'Book', 'updateBook');

$router->register('getProfile', 'Profile', 'getProfile');
$router->register('removeProfile', 'Profile', 'removeProfile');
$router->register('updateProfile', 'Profile', 'updateProfile');

?>