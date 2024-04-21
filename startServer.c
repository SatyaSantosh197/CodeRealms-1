#include <stdlib.h>

int main() {
    system("nodemon app.js");

    system("ngrok authtoken 2fO2drjH1APOvhwrIN8y84mEm9u_4ktm2NgquFKWH5nc9dWet");

    system("ngrok http 8000");

    return 0;
}
