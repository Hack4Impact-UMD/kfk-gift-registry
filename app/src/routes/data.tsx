import { createFileRoute } from '@tanstack/react-router'
import { ApprovedProfilesTable } from '@/components/tables/ApprovedProfilesTable/ApprovedProfilesTable'

//Testing data on profiles table
const testData = [
  {
    id: '1',
    childName: 'John Doe',
    parentGuardian: 'Jane Doe',
    email: 'jane@example.com',
    age: 8,
    diagnosis: 'test diagnosis',
    type: 'warrior' as const,
    giftsFulfilled: 2,
    giftsTotal: 5,
  },
  {
    id: '2',
    childName: 'Rainbow Waterfalls',
    parentGuardian: 'Kevin Waterfalls',
    email: 'kev@example.com',
    age: 11,
    diagnosis: 'test diagnosis',
    type: 'supersib' as const,
    giftsFulfilled: 0,
    giftsTotal: 3,
  }
]

export const Route = createFileRoute('/data')({
  component: () => <ApprovedProfilesTable data={testData} />
})