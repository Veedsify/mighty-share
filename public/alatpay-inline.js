import { ALATPay, type ALATPayRef, type Currency } from 'react-native-alatpay';

// ...

<ALATPay
        ref={alatpayRef}
        customerEmail="johndoe@mail.com"
        customerFirstName="John"
        customerLastName="Doe"
        amount={1000}
        currency={Currency.NGN}
        businessId={"your-business-id"}
        apiKey={"your-api-key"}
        onTransaction={(data) => console.log(data)}
        onClose={(data) => console.log(data)}
        autoStart={false}
      />