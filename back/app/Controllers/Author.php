<?php
namespace Controllers;
use vendor\Controller;
use Models\AuthorModel;

class Author extends Controller
{
    private $em;
    public function __construct() {
        $this->em = new AuthorModel();
    }
    public function getAuthors(){
        if(isset($_GET["id"])){
            return $this->em->getAuthor(array(":id"=>$_GET["id"]));
        }
        else{
            return $this->em->getAuthors();
        }
    }
    public function newAuthor()
    {
        if(isset($_POST["name"],$_POST["birth"],$_POST["region"])){
            return $this->em->newAuthor(array(":name"=>$_POST["name"],":birth"=>$_POST["birth"],":region"=>$_POST["region"]));
        }
        else{
            return self::response(204,"輸入的參數不完全");
        }
    }
    function removeAuthor()
    {
        if(isset($_GET["id"])){
            return $this->em->removeAuthor(array(":id"=>$_GET["id"]));
        }
        else{
            return self::response(204,"未帶id的請求");
        }
    }
    function updateAuthor()
    {
        if(isset($_POST["name"],$_POST["birth"],$_POST["region"],$_GET["id"])){
            return $this->em->updateAuthor(array(":name"=>$_POST["name"],":birth"=>$_POST["birth"],":region"=>$_POST["region"],":id"=>$_GET["id"]));
        }
        else{
            return self::response(204,"輸入的參數不完全");
        }
    }
}
