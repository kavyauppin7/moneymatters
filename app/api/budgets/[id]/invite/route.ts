import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/api/db/mongodb';
import { verifyToken } from '@/api/middleware/auth';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;
    const { email, role } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid budget ID' }, { status: 400 });
    }

    if (!email || !role) {
      return NextResponse.json({ error: 'Missing email or role' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Check if user has permission to invite (owner or admin)
    const budget = await db.collection('budgets').findOne({
      _id: new ObjectId(id),
      'members': {
        $elemMatch: {
          userId: new ObjectId(decoded.userId),
          role: { $in: ['owner', 'admin'] }
        }
      }
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found or insufficient permissions' }, { status: 404 });
    }

    // Find user by email
    const invitedUser = await db.collection('users').findOne({ email });
    if (!invitedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a member
    const isAlreadyMember = budget.members.some(
      (member: any) => member.userId.toString() === invitedUser._id.toString()
    );

    if (isAlreadyMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    // Add user to budget
    await db.collection('budgets').updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          members: {
            userId: invitedUser._id,
            role: role
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite user error:', error);
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 });
  }
}