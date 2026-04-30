// Each function takes the dynamic data and returns a complete HTML string
// In a real app you might use a templating engine like Handlebars or MJML
// for more complex designs

export function welcomeEmail(name: string,role:string): string {
    if (role=='GUEST'){
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF5A5F;">Welcome to Airbnb, ${name}!</h1>
            <p>Your account has been created successfully.</p>
            <p>Start exploring listings and book your next stay.</p>
            <a href="http://localhost:3000" style="background: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Explore Listings
            </a>
            </div>
        `;

    } else if (role=="HOST"){
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF5A5F;">Welcome to Airbnb, ${name}!</h1>
            <p>Your account has been created successfully.</p>
            <p>Start by creating your first listing.</p>
            <a href="http://localhost:3000" style="background: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                 Create Listings
            </a>
            </div>
        `;
    }

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF5A5F;">Welcome to Airbnb, ${name}!</h1>
            <p>Your account has been created successfully.</p>
        </div>
    `;
}


export function bookingConfirmationEmail(guestName: string, listingTitle: string, location: string, checkIn: string, checkOut: string, totalPrice: number): string {
    return `
        <p>Hello ${guestName} <br>Thank you for booking with us</p>
        <h1 style="color: #FF5A5F;">Listing details</h1>
        <ul>
            <li>${listingTitle}</li>
            <li>${location}</li>
            <li>${checkIn}</li>
            <li>${checkOut}</li>
            <li>${totalPrice}</li>
        </ul>

        <p>Note: please note that if you cancel this booking you will only get 80% refund</p>

    `;
}

export function bookingCancellationEmail(guestName: string, listingTitle: string, checkIn: string, checkOut: string): string {
    return `
        <p>Hello ${guestName} <br>the following listing were cancelled </p>
        <h1 style="color: #FF5A5F;">Listing details</h1>
        <ul>
            <li>${listingTitle}</li>
            <li>${checkIn}</li>
            <li>${checkOut}</li>
            
        </ul>

        <p>please find other listings of your convinience<p/>

        <p>Note: please note that if you cancel this booking you will only get 80% refund</p>

    `;
}

export function passwordResetEmail(name: string, resetLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Password Reset Request</h1>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <p>Click the button below. This link expires in 1 hour.</p>
      <a href="${resetLink}" style="background: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
      <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
    </div>
  `;
}