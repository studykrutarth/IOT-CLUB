<?php  
  // Replace contact@example.com with your real receiving email address
  // $receiving_email_address = 'contact@example.com';
  // if( file_exists($php_email_form = '../assets/vendor/php-email-form/php-email-form.php' )) {
  //   include( $php_email_form );
  // } else {
  //   die( 'Unable to load the "PHP Email Form" Library!');
  // }
  //$contact = new PHP_Email_Form;
  //$contact->ajax = true;
  //$contact->to = $receiving_email_address;
  //$contact->from_name = $_POST['name'];
  //$contact->from_email = $_POST['email'];
  //$contact->subject = $_POST['subject'];
  // Uncomment below code if you want to use SMTP to send emails. You need to enter your correct SMTP credentials
  /*
  $contact->smtp = array(
    'host' => 'example.com',
    'username' => 'example',
    'password' => 'pass',
    'port' => '587'
  );
  */
  // $contact->add_message( $_POST['name'], 'From');
  // $contact->add_message( $_POST['email'], 'Email');
  // $contact->add_message( $_POST['message'], 'Message', 10);
  // echo $contact->send();

  // if(isset($_POST['send'])){
  //   $con=mysqli_connect('localhost','root','','hrp1');
  //   $email=$_POST['email'];
  //   $subject=$_POST['subject'];
  //   $message=$_POST['message'];
  //   $sql="INSERT into contact (`email`,`subject`,`message`) values('$email','$subject','$message')";
  //   if(mysqli_query($con,$sql)){
  //     // echo "<script>alert('Your message has been sent');</script>";
  //     header("location:../home.php#contact");
  //   }else{
  //     // echo "<script>alert('Your message can't sent');</script>";
  //     header("location:../home.php");
  //   }
  // }else{
  //   echo "<script>alert('Your message can't sent');</script>";
  // }
?>
