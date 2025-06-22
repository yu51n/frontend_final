<?php
namespace Controllers;
use vendor\Controller;
use Models\CategoryModel;

class Category extends Controller
{
    private $em;
    public function __construct() {
        $this->em = new CategoryModel();
    }
    public function getCategories(){
        if(isset($_GET["id"])){
            return $this->em->getCategory(array(":id"=>$_GET["id"]));
        }
        else{
            return $this->em->getCategories();
        }
    }
    public function newCategory()
    {
        if(isset($_POST["name"])){
            return $this->em->newCategory(array(":name"=>$_POST["name"]));
        }
        else{
            return self::response(204,"輸入的參數不完全");
        }
    }
    function removeCategory()
    {
        if(isset($_GET["id"])){
            return $this->em->removeCategory(array(":id"=>$_GET["id"]));
        }
        else{
            return self::response(204,"未帶id的請求");
        }
    }
    function updateCategory()
    {
        if(isset($_POST["name"],$_GET["id"])){
            return $this->em->updateCategory(array(":name"=>$_POST["name"],":id"=>$_GET["id"]));
        }
        else{
            return self::response(204,"輸入的參數不完全");
        }
    }
}
