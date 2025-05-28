// app/api/post-payment/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Required fields validation
    if (!body.patient_id || !body.amount) {
      return NextResponse.json(
        { success: false, message: "Patient ID and amount are required" },
        { status: 400 }
      );
    }
    
    // EC2 instance URL - make sure this is correctly pointing to your EC2 instance
    const ecwApiUrl = 'http://3.137.160.70:8000/api/post-payment';
    
    console.log('Posting payment to:', ecwApiUrl);
    console.log('Payload:', JSON.stringify(body, null, 2));
    
    try {
      const response = await fetch(ecwApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          patient_id: body.patient_id,
          amount: Number(body.amount),
          payment_method: body.payment_method || 'Credit Card',
          service_date: body.service_date || undefined,
        }),
        signal: AbortSignal.timeout(90000), // 90 second timeout (ECW login might be slow)
      });
      
      // Get response content regardless of status to help with debugging
      const responseText = await response.text();
      let parsedResponse;
      
      try {
        // Try to parse as JSON
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText.substring(0, 500));
        
        // Return error with detailed information
        return NextResponse.json(
          { 
            success: false, 
            message: `Backend returned non-JSON response with status ${response.status}`,
            details: responseText.substring(0, 500) // First 500 chars for debugging
          },
          { status: 502 }
        );
      }
      
      // If we got here, we have a JSON response
      if (!response.ok) {
        return NextResponse.json(
          { 
            success: false, 
            message: parsedResponse.message || `Backend error: ${response.status}`,
            details: parsedResponse
          },
          { status: response.status }
        );
      }
      
      // Process successful response
      return NextResponse.json(parsedResponse);
      
    } catch (fetchError) {
      console.error('Fetch operation failed:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          message: `Connection to ECW service failed: ${fetchError.message || 'Unknown error'}`,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in API route handler:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `API error: ${error.message || 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}