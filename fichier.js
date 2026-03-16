  login = prompt("Entrer votre login ");
            if (login == null){
                document.write(" ");
            }
            else{
                while(login ==! "prof"){
                    login = prompt('login incorrect Entrer un autre login');

                 if (login == null) {
                    document.write(" ");
                    break;
                 }
                }
                if (login === "prof"){
                    var mot = "abcd";
                    var essai = 0;


                    password = prompt ('Enter votre mot de passe ');
                    while (password ==! mot && essai < 2){
                        essai++;
                        password = prompt ('mot de passe incorrect. Entre un autre mot de passe');
                        }

                        if(password ==! mot){
                            document.write('Erreur mot de passe incorrect, après 3 essais');
                            // break;
                        }
                         else{
                                prenom = prompt('Enter votre prénom?');
                                prenom = confirm ('votre prénom est bien  ' + prenom + '?');
                                if (ok){
                                   document.write(" login : " + login + "<br>");
                                   document.write( "Mot de passe : " + password + "<br>");
                                   document.write( " Prénom : " + prenom + "<br>");
                                }
                            }
                        }
                
                    } 