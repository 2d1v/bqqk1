import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent / 'backend'
sys.path.append(str(ROOT_DIR))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio

load_dotenv(ROOT_DIR / '.env')

async def seed_scripts():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing scripts
    await db.script_hub.delete_many({})
    
    sample_scripts = [
        {
            "id": "admin-1",
            "title": "Admin Commands",
            "subtitle": "Full admin panel with moderation tools",
            "category": "Admin",
            "code": """-- Admin Commands Script
local prefix = ";"

game.Players.LocalPlayer.Chatted:Connect(function(msg)
    if msg:lower():sub(1, #prefix + 3) == prefix .. "fly" then
        print("Flying enabled!")
    elseif msg:lower():sub(1, #prefix + 4) == prefix .. "god" then
        print("God mode enabled!")
    end
end)"""
        },
        {
            "id": "troll-1",
            "title": "Invisible Player",
            "subtitle": "Makes your character invisible to others",
            "category": "Troll",
            "code": """-- Invisible Player
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()

for _, part in pairs(character:GetDescendants()) do
    if part:IsA("BasePart") then
        part.Transparency = 1
    end
end

print("You are now invisible!")"""
        },
        {
            "id": "troll-2",
            "title": "Speed Hack",
            "subtitle": "Increase your walk speed dramatically",
            "category": "Troll",
            "code": """-- Speed Hack
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

humanoid.WalkSpeed = 100
print("Speed set to 100!")"""
        },
        {
            "id": "fun-1",
            "title": "Rainbow Character",
            "subtitle": "Makes your character flash rainbow colors",
            "category": "Fun",
            "code": """-- Rainbow Character
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()

while true do
    for _, part in pairs(character:GetDescendants()) do
        if part:IsA("BasePart") then
            part.Color = Color3.fromHSV(tick() % 5 / 5, 1, 1)
        end
    end
    wait(0.1)
end"""
        },
        {
            "id": "fun-2",
            "title": "Jump Power",
            "subtitle": "Jump super high like on the moon",
            "category": "Fun",
            "code": """-- Jump Power
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

humanoid.JumpPower = 200
print("Jump power boosted!")"""
        },
        {
            "id": "admin-2",
            "title": "Teleport Tool",
            "subtitle": "Teleport to any player in the game",
            "category": "Admin",
            "code": """-- Teleport Tool
local prefix = ";"

game.Players.LocalPlayer.Chatted:Connect(function(msg)
    if msg:lower():sub(1, #prefix + 3) == prefix .. "tp " then
        local targetName = msg:sub(#prefix + 4)
        local target = game.Players:FindFirstChild(targetName)
        
        if target and target.Character then
            game.Players.LocalPlayer.Character:MoveTo(target.Character.HumanoidRootPart.Position)
            print("Teleported to " .. targetName)
        end
    end
end)"""
        }
    ]
    
    await db.script_hub.insert_many(sample_scripts)
    print(f"Seeded {len(sample_scripts)} scripts successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_scripts())
