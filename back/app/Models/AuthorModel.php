<?php
namespace Models;
use vendor\DB;
class AuthorModel
{
    public function getAuthors(){
        return DB::select("select * from authors",NULL);
    }
    public function getAuthor($id){
        return DB::select("select * from authors where id=:id",$id);
    }
    public function newAuthor($args)
    {
        return DB::insert("INSERT INTO `authors`(`name`, `birth`, `region`) VALUES (:name,:birth,:region)",$args);
    }
    function removeAuthor($id)
    {
        return DB::delete("DELETE FROM `authors` WHERE `id`=:id",$id);
    }
    function updateAuthor($args)
    {
        return DB::update("UPDATE `authors` SET `name`=:name,`birth`=:birth,`region`=:region WHERE id=:id",$args); 
    }
}
