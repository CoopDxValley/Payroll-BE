# Enterprise Payroll as a Service System

A robust approval workflow system that enables companies to manage approval processes with flexible, company-specific approval and rejection policies. The system supports both hierarchical and parallel workflows, with configurable approval rules and rejection policies.

## Features

## NEW

- **Flexible Workflow Types**

  - Fully Parallel: All stages active simultaneously
  - Hierarchical: Sequential stage processing
  - Stage-Level Parallel Approvals: Multiple roles can approve concurrently within a stage

- **Approval Rules**

  - Subset: Specific roles must approve
  - AnyN: Any N users from a set of roles can approve
  - All: Every role must approve
  - Conditional: Approvals based on request data
  - Hierarchical: Role-based approval sequence
  - Weighted: Approval weights with thresholds

- **Rejection Policies**
  - Halt: Stop workflow and require resubmission
  - RequireAll: Stage rejected only if all approvers reject
  - Ignore: Continue despite rejections
  - Rollback: Revert to specified stage
  - Escalate: Forward to higher authority
  - ConditionalReject: Rejection behavior based on request data

## Technical Stack

- **Backend**: Node.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **API**: Express.js with express-validator
- **Validation**: Zod for runtime type checking

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd approval-workflow-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/approval_workflow?schema=public"
   NODE_ENV="development"
   PORT=3000
   ```

4. Initialize the database:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Workflows

- `POST /api/workflows` - Create a new workflow

  ```json
  {
    "name": "Budget Approval",
    "companyId": "uuid",
    "departmentId": "uuid",
    "requestType": "budget",
    "isFullyParallel": false
  }
  ```

- `POST /api/workflows/:workflowId/stages` - Add a stage to a workflow
  ```json
  {
    "name": "Manager Approval",
    "isParallel": true,
    "requiredApprovals": 2,
    "approvalRules": {
      "type": "subset",
      "required": 2,
      "roles": ["uuid1", "uuid2"]
    },
    "rejectionRules": {
      "policy": "halt"
    },
    "roleIds": ["uuid1", "uuid2"],
    "order": 1
  }
  ```

### Requests

- `POST /api/requests` - Create a new request
  ```json
  {
    "type": "budget",
    "createdById": "uuid",
    "details": {
      "amount": 10000,
      "purpose": "Office supplies"
    },
    "workflowId": "uuid"
  }
  ```

### Approvals

- `POST /api/approvals` - Handle approval/rejection

  ```json
  {
    "instanceId": "uuid",
    "stageId": "uuid",
    "roleId": "uuid",
    "userId": "uuid",
    "action": "approve",
    "comments": "Approved with minor changes"
  }
  ```

- `GET /api/instances/:instanceId` - Get workflow instance status

## Approval Rules Examples

1. **Subset Rule**

   ```json
   {
     "type": "subset",
     "required": 2,
     "roles": ["Manager", "Director"]
   }
   ```

2. **AnyN Rule**

   ```json
   {
     "type": "anyN",
     "required": 2,
     "roles": ["Manager", "Director", "VP"]
   }
   ```

3. **Conditional Rule**

   ```json
   {
     "type": "conditional",
     "condition": {
       "field": "amount",
       "operator": ">",
       "value": 1000
     },
     "required": 1,
     "roles": ["CFO"]
   }
   ```

4. **Weighted Rule**
   ```json
   {
     "type": "weighted",
     "threshold": 5,
     "weights": {
       "Manager": 2,
       "Director": 3,
       "CFO": 5
     }
   }
   ```

## Rejection Policy Examples

1. **Halt Policy**

   ```json
   {
     "policy": "halt"
   }
   ```

2. **Rollback Policy**

   ```json
   {
     "policy": "rollback",
     "targetStage": 1
   }
   ```

3. **Escalate Policy**

   ```json
   {
     "policy": "escalate",
     "escalationRoleId": "uuid"
   }
   ```

4. **Conditional Reject Policy**
   ```json
   {
     "policy": "conditionalReject",
     "condition": {
       "field": "amount",
       "operator": "<",
       "value": 500
     },
     "action": "ignore"
   }
   ```

## Development

- Run tests: `npm test`
- Generate Prisma client: `npm run prisma:generate`
- Apply database migrations: `npm run prisma:migrate`
- Lint code: `npm run lint`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
