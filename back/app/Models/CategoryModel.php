<?php
namespace Models;
use vendor\DB;
class CategoryModel
{
    public function getCategories(){
        return DB::select("SELECT * FROM `categories`",NULL);
    }
    public function getCategory($id){
        return DB::select("SELECT * FROM `categories` WHERE id=:id",$id);
    }
    public function newCategory($args)
    {
        return DB::insert("INSERT INTO `categories`(`name`) VALUES (:name)",$args);
    }
    function removeCategory($id)
    {
        return DB::delete("DELETE FROM `categories` WHERE `id`=:id",$id);
    }
    function updateCategory($args)
    {
        return DB::update("UPDATE `categories` SET `name`=:name WHERE `id`=:id",$args); 
    }
}
