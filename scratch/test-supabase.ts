import { supabase } from "./src/lib/supabase";

async function testUpdate() {
  console.log("Fetching first message...");
  const { data: messages } = await supabase.from("contacts").select("*").limit(1);
  if (!messages || messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  const msg = messages[0];
  console.log(`Testing update for message ID: ${msg.id}, current is_read: ${msg.is_read}`);
  
  const { data, error, status, statusText } = await supabase
    .from("contacts")
    .update({ is_read: !msg.is_read })
    .eq("id", msg.id)
    .select();

  console.log("Status:", status, statusText);
  if (error) {
    console.error("Update Error:", error);
  } else {
    console.log("Update Success! Returned data:", data);
  }
}

testUpdate();
