<?php
namespace Models;
use vendor\DB;
class BookModel
{
    public function getBooks(){
        return DB::select("SELECT books.id,title,name FROM books,authors WHERE books.author_id=authors.id",NULL);
    }
    public function getBook($id){
        return DB::select("SELECT books.id,title,name,author_id FROM books,authors WHERE books.author_id=authors.id and books.id=:id",$id);
    }
    public function getBookCategoris($id){
        return DB::select("SELECT name,categories.id FROM categories,books,book_categories WHERE book_categories.book_id=books.id and book_categories.category_id=categories.id and books.id=:id",$id);
    }
    public function newBook($args)
    {
        return DB::insert("INSERT INTO `books`(`id`,`title`, `author_id`) VALUES (:id,:title,:author_id)",$args);
    }
    public function newBookCategoris($args){
        return DB::insert("INSERT INTO `book_categories`(`book_id`, `category_id`) VALUES (:book_id,:category_id)",$args);
    }
    function removeBook($id)
    {
        return DB::delete("DELETE FROM `books` WHERE `id`=:id",$id);
    }
    public function removeBookCategoris($id){
        return DB::delete("DELETE FROM `book_categories` WHERE book_id=:book_id",$id);
    }
    function updateBook($args){
        return DB::update("UPDATE `books` SET `id`=:id,`title`=:title,`author_id`=:author_id WHERE `id`=:preid",$args); 
    }
}
