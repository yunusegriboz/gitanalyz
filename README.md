# gitanalyz

A CLI tool for analyze git logs.

## How to install ?

You can install `gitanalyz` globally using the `-g` flag with the command `"npm i -g gitanalyz"`.
This way, you won’t need to install it separately for each project.

(It is a good idea to install it globally, as you can simply open the terminal and type `gitanalyz` to use it in any project.)

## How to use ?

Open a terminal in the project directory and type `"gitanalyz"`
Note that IDE terminals may not work due to `Execution Policy` restrictions; you will need to open the terminal manually.

## Help

If you have trouble with the commands:

|Usage			 						 |Answers                        				  |
|----------------------------------------|------------------------------------------------|
|`"gitanalyz"`							 |List project members and their contributions.   |
|`"gitanalyz <author_email>"`				 |List all commits by the specified author.		  |
|`"gitanalyz <author_email> last <number>"`|List the last N commits by the specified author.|
|`"gitanalyz -help"`						 |Display this help message.					  |


## Author

Author: tikhi

Github: "https://github.com/yunusegriboz"