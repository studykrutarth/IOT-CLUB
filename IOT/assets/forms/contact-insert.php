<?php
if(isset($_POST['send'])){
    $con=mysqli_connect('localhost','root','','db_healthcare');
    $email=$_POST['email'];
    $subject=$_POST['subject'];
    $message=$_POST['message'];
    $sql="INSERT into contact (`email`,`subject`,`message`) values('$email','$subject','$message')";
    if(mysqli_query($con,$sql)){
      //echo "<script>alert('Your message has been sent');</script>";
      header("location:../home.php#contact");
    }else{
      //echo "<script>alert('Your message can't sent');</script>";
      header("location:../home.php");
    }
  }else{
    echo "<script>alert('Your message can't sent');</script>";
  }
?>